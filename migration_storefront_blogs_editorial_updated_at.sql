-- Apply separately after review. No production data is changed by adding this file.
CREATE OR REPLACE FUNCTION public.set_storefront_blogs_editorial_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF ROW(NEW.title, NEW.slug, NEW.content, NEW.description, NEW.cover_image,
         NEW.seo_title, NEW.cover_image_alt, NEW.author_name)
     IS DISTINCT FROM
     ROW(OLD.title, OLD.slug, OLD.content, OLD.description, OLD.cover_image,
         OLD.seo_title, OLD.cover_image_alt, OLD.author_name) THEN
    NEW.updated_at := now();
  ELSE
    NEW.updated_at := OLD.updated_at;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_storefront_blogs_editorial_updated_at ON public.storefront_blogs;
CREATE TRIGGER trg_storefront_blogs_editorial_updated_at
BEFORE UPDATE ON public.storefront_blogs
FOR EACH ROW EXECUTE FUNCTION public.set_storefront_blogs_editorial_updated_at();
