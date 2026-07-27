function createAnnouncementHandlers({ supabase, notifyStorefrontAnnouncementChange }) {
  return {
    get: async (_req, res) => {
      try {
        const { data, error } = await supabase
          .from('storefront_announcements')
          .select('*')
          .order('display_order', { ascending: true });
        if (error) throw error;
        res.json(data);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    },
    create: async (req, res) => {
      try {
        const { data, error } = await supabase
          .from('storefront_announcements')
          .insert([req.body])
          .select();
        if (error) throw error;
        await notifyStorefrontAnnouncementChange().catch(() => false);
        res.json(data[0]);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    },
    update: async (req, res) => {
      try {
        const { data, error } = await supabase
          .from('storefront_announcements')
          .update(req.body)
          .eq('id', req.params.id)
          .select();
        if (error) throw error;
        await notifyStorefrontAnnouncementChange().catch(() => false);
        res.json(data[0]);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    },
    remove: async (req, res) => {
      try {
        const { error } = await supabase
          .from('storefront_announcements')
          .delete()
          .eq('id', req.params.id);
        if (error) throw error;
        await notifyStorefrontAnnouncementChange().catch(() => false);
        res.json({ success: true });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    },
  };
}

module.exports = { createAnnouncementHandlers };
