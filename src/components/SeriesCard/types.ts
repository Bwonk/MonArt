// This file is auto-generated — do not edit manually.
import type { IkasImage, IkasNavigationLink } from "@ikas/bp-storefront";
import type { Seri } from "../../global-types";

export interface Props {
  badge?: string;
  name?: string;
  subtitle?: string;
  description?: string;
  frontImage?: IkasImage | null;
  frontAlt?: string;
  backImage?: IkasImage | null;
  backAlt?: string;
  link?: IkasNavigationLink | null;
  flipLabel?: string;
  /** Doluysa karta tıklayınca linke ?seri=<seri> eklenir */
  seriesKey?: Seri;
}
