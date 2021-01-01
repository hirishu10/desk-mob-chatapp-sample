import Head from "next/head";
import Image from "next/image";
import React from "react";
import styles from "../styles/Components/Setting.module.scss";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, dbAuth, provider } from "../firebase";
import * as firestore from "firebase/firestore";
import { useSelector, useDispatch } from "react-redux";
import VerifiedIcon from "@mui/icons-material/Verified";
import { useEffect } from "react";
import { useState } from "react";
import axios from "axios";

function Setting() {
  // const dispatch = useDispatch();
  const { email, isDarkMode } = useSelector((state) => state.actionCombined);
  const [user, loading] = useAuthState(auth);
  const [photoFlag, setPhotoFlag] = useState(false);
  const iconColorConfig = {
    color: isDarkMode ? "#c8d1da" : "#072130",
    bColor: isDarkMode ? "#223540" : "white",
    bColorForOptions: isDarkMode ? "#0c1118" : "#d7dee5",
  };

  useEffect(() => {
    axios
      .get(user?.photoURL)
      .then((r) => {
        setTimeout(() => {
          r.status === 200 ? setPhotoFlag(true) : setPhotoFlag(false);
        }, 200);
      })
      .catch((err) => {
        console.log("Something went wrong ", err);
      });
  }, [photoFlag]);
  return (
    <div
      className={styles.container}
      style={{
        backgroundColor: iconColorConfig?.bColor,
        color: iconColorConfig?.color,
      }}
    >
      <Head>
        <title>Profile</title>
        <meta name="Profile" content="Desktop and Mobile ChatApp For Free!" />
        <link rel="icon" href="/rishufavicon.ico" />
      </Head>
      <div
        className={styles.mainContainer}
        style={{
          boxShadow: isDarkMode
            ? "0px 0px 10px 1px #2e6139"
            : "0px 0px 10px 2px #e6e6e6",
        }}
      >
        {/* PhotoContainer */}
        <div className={styles.photoContainer}>
          <div className={styles.photoBlock}>
            <div className={styles.photoBox}>
              <img
                className={styles.photo}
                src={
                  photoFlag
                    ? user?.photoURL
                    : "https://raw.githubusercontent.com/hirishu10/my-assets/main/react-login-ui/profile.png"
                }
                width={"155px"}
                height={"155px"}
              />
            </div>
            {/*  */}
            <div
              className={styles.verifiedCircle}
              style={{
                backgroundColor: user?.emailVerified ? "#1976d2" : "grey",
              }}
            >
              <VerifiedIcon
                className={styles.verified}
                sx={{ width: "80%", height: "80%", color: "white" }}
              />
              <div
                className={styles.verifiedText}
                style={{
                  backgroundColor: iconColorConfig.bColorForOptions,
                  color: iconColorConfig.color,
                }}
              >
                {user?.emailVerified
                  ? "Account Verified ✅"
                  : "Account Unverified 🛑"}
              </div>
            </div>
          </div>
        </div>
        {/* PhotoContainer */}
        {/* DatContainer */}
        <div className={styles.dataContainer}>
          <div className={styles.dataContainerOne}>
            <div className={styles.dataContainerOneTitle}>Name: </div>
            <div className={styles.dataContainerOneDesc}>
              {user?.displayName}
            </div>
          </div>
          <div className={styles.dataContainerTwo}>
            <div className={styles.dataContainerTwoTitle}>Email: </div>
            <div className={styles.dataContainerTwoDesc}>{user?.email}</div>
          </div>
        </div>
        {/* DatContainer */}
      </div>
    </div>
  );
}

export default Setting;
