import { router } from "../t";
import { menuRouter } from "./menu.route";
import { databaseRouter } from "./database.route";
import { settingsRouter } from "./settings.route";
import { extensionsRouter } from "./extensions.route";
import { deniesRouter } from "./denies.route";
import { galleryRouter } from "./gallery.route";
import { cmsRouter } from "./cms.route";
import { servicesRouter } from "./services.route";

export const administratorRouter = router({
  menu: menuRouter,
  database: databaseRouter,
  settings: settingsRouter,
  extensions: extensionsRouter,
  denies: deniesRouter,
  gallery: galleryRouter,
  cms: cmsRouter,
  services: servicesRouter,
});

