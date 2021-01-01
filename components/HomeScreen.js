import React, { useEffect, useState } from "react";
import hStyle from "../styles/Home/Home.module.scss";
import { getCustomFullDateAndTimeWithAmPmIncludingSeconds } from "@hirishu10/simple-date-time";
import Image from "next/image";
import { useSelector, useDispatch } from "react-redux";

function HomeScreen() {
  // const dispatch = useDispatch();
  const { email, isDarkMode } = useSelector((state) => state.actionCombined);

  const [getClockValue, setClockValue] = useState("Date-Time");

  const runClock = () => {
    const n = getCustomFullDateAndTimeWithAmPmIncludingSeconds(true);
    setClockValue(n);
  };

  useEffect(() => {
    setInterval(() => {
      runClock();
    }, 1000);
    //return the function which help to set state the normal when page not rendered!
    return () => {
      setClockValue("Date-Time");
    };
  }, []);

  return (
    <div
      className={hStyle.container}
      style={{
        backgroundColor: isDarkMode ? "#082323" : "#082330",
      }}
    >
      <div className={hStyle.containerOne}>{`${getClockValue} 2022`}</div>
      <div className={hStyle.containerTwo}>Desk-Mob ChatApp</div>
      <div className={hStyle.containerThree}>
        {/* <!-- Footer --> */}
        <div className={hStyle.containerForLogo}>
          <div className={hStyle.containerForLogoTitle}>from</div>
          <div className={hStyle.containerForLogoImage}>
            <Image
              src={"/footerLogo/myLogo.svg"}
              alt={"Rishu Chowdhary"}
              width={"40px"}
              height={"27px"}
              priority={true}
            />
            <span style={{ fontSize: "18px", color: "white" }}>Rishu</span>
          </div>
        </div>
        {/* <!-- Footer --> */}
      </div>
    </div>
  );
}

export default HomeScreen;
