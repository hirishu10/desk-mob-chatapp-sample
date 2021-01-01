import Head from "next/head";
import { Button } from "@mui/material";
import { auth, provider } from "../firebase";
import * as firebaseAuth from "firebase/auth";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import Splash from "./splash";
import lStyle from "../styles/LoginScreen.module.scss";
import Image from "next/image";
import $ from "jquery";
import "animate.css";
import { useState } from "react";

export default function Login() {
  const router = useRouter();
  const [user, loading] = useAuthState(auth);
  const [windowWidth, setWindowWidth] = useState(window?.innerWidth);
  const [designActivate, setdesignActivate] = useState(false);

  /**
   * It's helps to redirect the splash if the user not authenticated
   */
  if (user) {
    return <Splash />;
  }

  /**
   * Google SignIn Popup
   */
  const signInGoogle = () => {
    firebaseAuth
      .signInWithPopup(auth, provider)
      .then((ok) => {
        const encodedURL = encodeURIComponent(auth?.currentUser?.email);
        router.replace(`/${encodedURL}`);
      })
      .catch((err) => {
        console.log("err :>> ", err);
      });
  };

  useEffect(() => {
    setWindowWidth(window?.innerWidth);
    // console.log("windowWidth", windowWidth); //::::Debug
    if (!designActivate) {
      setTimeout(() => {
        setdesignActivate(true);
        if (windowWidth > 680) {
          $("#design").addClass("animate__animated animate__slideInLeft");
          $("#designTitle").addClass("animate__animated animate__slideInRight");
          setTimeout(() => {
            $("#design").removeClass("animate__animated animate__slideInLeft");
            $("#designTitle").removeClass(
              "animate__animated animate__slideInRight"
            );
          }, 1200);
        }
      }, 100);
    }
  }, []);

  return (
    <div>
      <div className={lStyle.outerContainer}>
        <Head>
          <title>Desk-Mob ChatApp</title>
          <meta
            name="Desk-Mob ChatApp"
            content="Desktop and Mobile ChatApp For Free!"
          />
          <link rel="icon" href="/rishufavicon.ico" />
          <link
            rel="img"
            href="https://raw.githubusercontent.com/hirishu10/my-assets/main/desk-mobChatApp/deskMobLogin.webp"
          />
        </Head>

        <div className={lStyle.mainContainer}>
          {designActivate ? (
            <>
              <div className={lStyle.loginContainer}>
                <div id={"designTitle"}>
                  <h1>Desk-Mob ChatApp</h1>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={signInGoogle}
                  >
                    SignIn with Google
                  </Button>
                </div>
              </div>
              {/* This is not rendered for the laptop or higher only for mobile and below */}
              <div className={lStyle.mobileLoginContainer}>
                <div className={lStyle.mobileLoginContainerTitle}>
                  <h1>Desk-Mob ChatApp</h1>
                </div>
                <div className={lStyle.mobileLoginContainerButtoms}>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={signInGoogle}
                  >
                    SignIn with Google
                  </Button>
                </div>
              </div>
              {/* This is not rendered for the laptop or higher only for mobile and below */}
              <div className={lStyle.designContainer}>
                <Image
                  id={"design"}
                  src="/login.webp"
                  width={"500px"}
                  height={"300px"}
                  priority={true}
                />
              </div>
            </>
          ) : null}
        </div>
      </div>
      {/* <!-- Footer --> */}
      <div className={lStyle.containerForLogo}>
        <div className={lStyle.containerForLogoTitle}>from</div>
        <div className={lStyle.containerForLogoImage}>
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
  );
}
