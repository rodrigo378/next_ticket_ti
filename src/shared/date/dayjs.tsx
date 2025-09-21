// src/shared/date/dayjs.ts
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import localizedFormat from "dayjs/plugin/localizedFormat";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import "dayjs/locale/es";

dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);
dayjs.locale("es");
dayjs.extend(isSameOrBefore);

export default dayjs;
