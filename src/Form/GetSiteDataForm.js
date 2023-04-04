import React, { useEffect, useState } from "react";
import { TextField, Button, Typography, CircularProgress } from "@mui/material";
import axios from "axios";
import { ScrapingBeeClient } from "scrapingbee";
import cheerio from "cheerio";
import { URLs } from "./TestURLList";

const GetSiteDataForm = () => {
  const [siteUrl, setSiteUrl] = useState("");
  const [siteUrlDummy, setSiteUrlDummy] = useState("");
  const [siteInfo, setSiteInfo] = useState({
    title: "",
    description: "",
    author: "",
    contentType: "",
    language: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateUrl = async (value) => {
    return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(
      value
    );
  };

  const getSiteData = async (url) => {
    let client = new ScrapingBeeClient(
      "6JXSVDEAKWCGPQHF67L4ISD1RLIDLVH9LCG2AA09HITOTVDMGV5TXKYTT8ZAU417POJE4N5FJ3XPCF6I"
    );
    let response = await client.get({
      url: url,
      params: {},
    });
    return response;
  };

  const SAFE_BROWSING_API =
    "https://safebrowsing.googleapis.com/v4/threatMatches:find?key=AIzaSyCj3G4XcYzm12RANBH7Mxp_uG-FQqvjcRA";

  const SAFE_BROWSING_BODY = {
    client: {
      clientId:
        "28697533529-a0k2ta7frvrp9d2j1b7itnh4as8ir06i.apps.googleusercontent.com",
      clientVersion: "1.5.2",
    },
    threatInfo: {
      threatTypes: ["MALWARE", "SOCIAL_ENGINEERING"],
      platformTypes: ["WINDOWS"],
      threatEntryTypes: ["URL"],
      threatEntries: [{ url: siteUrl }],
    },
  };

  useEffect(() => {
    if (!siteUrl) {
      setSiteInfo({
        title: "",
        description: "",
        author: "",
        contentType: "",
        language: "",
      });
    }
  }, [siteUrl]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const value = await validateUrl(siteUrl);
    if (value) {
      setLoading(true);
      await axios
        .post(SAFE_BROWSING_API, SAFE_BROWSING_BODY, {
          headers: { "Content-Type": "application/json" },
        })
        .then((res) => {
          console.log(res, "safe browsing response");
          if (res) {
            getSiteData(siteUrl)
              .then(function (response) {
                setLoading(false);
                let decoder = new TextDecoder();
                let text = decoder.decode(response.data);
                const $ = cheerio.load(text);
                setSiteInfo({
                  ...siteInfo,
                  title: $("title").text() || "No Title Found",
                  description:
                    $(`meta[name="description"]`)[0]?.attribs?.content ||
                    "No Description Found",
                  author:
                    $(`meta[name="author"]`)[0]?.attribs?.content ||
                    "No Author Found",
                  contentType: response.headers["content-type"],
                  language:
                    $("html")[0]?.attribs?.lang || "Not any language detected.",
                });
                setSiteUrlDummy(siteUrl);
                setError("");
              })
              .catch((e) => {
                setLoading(false);
                console.log("Something went wrong. " + e);
                setError("Something went wrong. " + e);
                setTimeout(() => {
                  setError("");
                }, 5000);
              });
          }
        })
        .catch((err) => {
          console.log(
            "URL contains malicious contents. Please choose another URL."
          );
          setError(
            "URL contains malicious contents. Please choose another URL."
          );
          setLoading(false);
        });
    } else {
      setError("Please enter a valid URL.");
      setTimeout(() => {
        setError("");
      }, 5000);
      setSiteInfo({
        title: "",
        description: "",
        author: "",
        contentType: "",
        language: "",
      });
    }
  };

  return (
    <div style={{ marginTop: 30 }}>
      <form style={{ textAlign: "center" }}>
        <TextField
          className={`${error ? "hasError" : ""}`}
          fullWidth
          id="outlined-basic"
          label="Site URL"
          variant="outlined"
          value={siteUrl}
          onChange={(e) => setSiteUrl(e.target.value)}
        />
        <Button
          sx={{ mt: 3 }}
          type="submit"
          variant="contained"
          size="large"
          onClick={handleSubmit}
        >
          Submit
        </Button>
      </form>
      {loading ? (
        <Typography align="center" sx={{ mt: 4 }}>
          <CircularProgress />
        </Typography>
      ) : (
        <>
          {error && (
            <Typography
              sx={{ mt: 3 }}
              variant="body1"
              align="center"
              style={{ color: "red" }}
            >
              {error}
            </Typography>
          )}
          {siteInfo?.title && (
            <>
              <Typography sx={{ mt: 3 }} variant="h4">
                URL Information:
              </Typography>
              <Typography
                sx={{ mt: 3 }}
                variant="h5"
                style={{ color: "green" }}
              >
                Title:- {siteInfo?.title}
              </Typography>
            </>
          )}
          {siteInfo?.description && (
            <Typography sx={{ mt: 3 }} variant="h6">
              Description:- {siteInfo?.description}
            </Typography>
          )}
          {siteInfo?.author && (
            <Typography sx={{ mt: 3 }} variant="h6">
              Author: {siteInfo?.author}
            </Typography>
          )}
          {siteInfo?.contentType && (
            <Typography sx={{ mt: 3 }} variant="h6">
              Content-type: {siteInfo?.contentType}
            </Typography>
          )}
          {siteUrlDummy && (
            <Typography sx={{ mt: 3 }} variant="h6">
              URL: {siteUrlDummy}
            </Typography>
          )}
          {siteInfo?.language && (
            <Typography sx={{ mt: 3 }} variant="h6">
              Language:{" "}
              {siteInfo?.language === "en" ? "English" : siteInfo?.language}
            </Typography>
          )}
        </>
      )}
      <br />
      <hr />
      <Typography variant="body1" sx={{ mt: 3, mb: 1 }}>
        Test URLs
      </Typography>
      {URLs.map((url) => {
        return (
          <div key={url}>
            <a
              href="javascript:void(0)"
              onClick={() => {
                setSiteUrl(url);
                setSiteInfo({
                  title: "",
                  description: "",
                  author: "",
                  contentType: "",
                  language: "",
                });
                setSiteUrlDummy("");
              }}
            >
              {url}
            </a>
          </div>
        );
      })}
    </div>
  );
};

export default GetSiteDataForm;
