import { useEffect, useState } from "react";
import { subscribeMemuat } from "../loadingStore";

// True selama ada request GET yang belum selesai.
export default function useSedangMemuat() {
  const [aktif, setAktif] = useState(false);

  useEffect(() => subscribeMemuat(setAktif), []);

  return aktif;
}
