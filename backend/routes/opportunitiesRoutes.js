import express from "express";
import supabase from "../config/supabaseClient.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();


// ✅ 1. Create Opportunity (Organization Only)
router.post("/", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "organization") {
      return res.status(403).json({ error: "Only organizations can create opportunities" });
    }

    const { title, description, location, date } = req.body;

    const { data, error } = await supabase
      .from("opportunities")
      .insert([
        {
          title,
          description,
          location,
          date,
          organization_id: req.user.id,
        },
      ])
      .select();

    if (error) throw error;

    res.status(201).json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ✅ 2. Get All Opportunities (Public)
router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("opportunities")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ✅ 3. Apply to Opportunity (Volunteer Only)
router.post("/:id/apply", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "volunteer") {
      return res.status(403).json({ error: "Only volunteers can apply" });
    }

    const opportunityId = req.params.id;

    const { data: opportunity } = await supabase
      .from("opportunities")
      .select("*")
      .eq("id", opportunityId)
      .single();

    const { data: existing } = await supabase
      .from("applications")
      .select("*")
      .eq("opportunity_id", opportunityId)
      .eq("volunteer_id", req.user.id)
      .single();

    if (existing) {
      return res.status(400).json({ error: "Already applied" });
    }

    const { data, error } = await supabase
      .from("applications")
      .insert([
        {
          opportunity_id: opportunityId,
          volunteer_id: req.user.id,
          status: "pending",
        },
      ])
      .select();

    if (error) throw error;

    // 🔔 Notification for organization
    await supabase.from("notifications").insert([
      {
        user_id: opportunity.organization_id,
        message: "A volunteer applied to your opportunity.",
      },
    ]);

    res.status(201).json(data[0]);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// ✅ 4. Get My Applications (Volunteer)
router.get("/my/applications", verifyToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("applications")
      .select("*, opportunities(*)")
      .eq("volunteer_id", req.user.id);

    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Get applicants for organization
router.get("/org/applications", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "organization") {
      return res.status(403).json({ error: "Only organizations allowed" });
    }

    const { data, error } = await supabase
      .from("applications")
      .select("*, users(*), opportunities(*)")
      .eq("opportunities.organization_id", req.user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.patch("/applications/:id/status", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "organization") {
      return res.status(403).json({ error: "Only organizations allowed" });
    }

    const { status } = req.body;

    // Get application first
    const { data: application, error: fetchError } = await supabase
      .from("applications")
      .select("*")
      .eq("id", req.params.id)
      .single();

    if (fetchError) throw fetchError;

    // Update status
    const { data, error } = await supabase
      .from("applications")
      .update({ status })
      .eq("id", req.params.id)
      .select();

    if (error) throw error;

    // 🔔 Notify volunteer
    await supabase.from("notifications").insert([
      {
        user_id: application.volunteer_id,
        message: `Your application was ${status}.`,
      },
    ]);

    res.json(data[0]);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get("/stats", verifyToken, async (req, res) => {
  try {
    if (req.user.role === "organization") {
      const { count, error } = await supabase
        .from("opportunities")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", req.user.id);

      if (error) throw error;

      return res.json({ opportunities: count });
    }

    if (req.user.role === "volunteer") {
      const { count, error } = await supabase
        .from("applications")
        .select("*", { count: "exact", head: true })
        .eq("volunteer_id", req.user.id);

      if (error) throw error;

      return res.json({ applications: count });
    }

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get("/notifications", verifyToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.patch("/notifications/:id/read", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id);

    if (error) throw error;

    res.json({ message: "Notification marked as read" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.patch("/applications/:id/complete", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "organization") {
      return res.status(403).json({ error: "Only organizations allowed" });
    }

    const { id } = req.params;
    const { completed, feedback } = req.body; // true or false

    if (!feedback) {
      return res.status(400).json({ error: "Feedback required" });
    }

    const { data: app, error: fetchError } = await supabase
      .from("applications")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError) throw fetchError;

    if (app.status !== "approved") {
      return res.status(400).json({ error: "Application not approved" });
    }

    // Update completion
    const { error: updateError } = await supabase
      .from("applications")
      .update({
        completed,
        completed_at: new Date()
      })
      .eq("id", id);

    if (updateError) throw updateError;

    // Rating logic
    const ratingChange = completed ? 1 : -1;

    // Insert rating record
    await supabase.from("ratings").insert([{
      volunteer_id: app.volunteer_id,
      organization_id: req.user.id,
      application_id: id,
      rating: ratingChange,
      feedback
    }]);

    res.json({ message: "Performance recorded" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.post("/applications/:id/rate", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { rating, feedback } = req.body;

  const { data: app } = await supabase
    .from("applications")
    .select("*")
    .eq("id", id)
    .single();

  if (!app.completed) {
    return res.status(400).json({ error: "Event not completed yet" });
  }

  const { data, error } = await supabase
    .from("ratings")
    .insert([{
      volunteer_id: app.volunteer_id,
      organization_id: req.user.id,
      application_id: id,
      rating,
      feedback
    }])
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });

  res.json(data);
});
// =============================
// 8️⃣ GET VOLUNTEER TOTAL RATING
// =============================
router.get("/volunteer/:id/rating", async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("ratings")
      .select("rating")
      .eq("volunteer_id", id);

    if (error) throw error;

    const totalRating = data.reduce((sum, r) => sum + r.rating, 0);

    res.json({ rating: totalRating });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
export default router;