import { roundStatusType } from "types";
import { getVoteToResult } from "./src/api/supabase/gamePlayAPI";

const test = async () => {
  const roundStatus: roundStatusType = { INIT: "init" };

  for (let i = 0; i < 7; i++) {
    const key = `R0_${i}`;
    const value = `r0-${i}`;

    roundStatus[key] = value;
  }

  for (let i = 0; i < 23; i++) {
    const key = `R1_${i}`;
    const value = `r1-${i}`;

    roundStatus[key] = value;
  }

  roundStatus["R2_0"] = "r2-0";

  console.log(roundStatus.INIT);
};

test();
