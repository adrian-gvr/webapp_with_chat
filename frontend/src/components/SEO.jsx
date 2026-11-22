import React from "react";
import { Helmet } from "react-helmet-async";

function SEO({ title, description, image, url, type = "website" }) {
  const siteTitle = "CreativePortfolio";
  const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
  const defaultDescription =
    "Portfolio creativo di fotografia, videoarte e graphic design. Scopri i miei lavori e contattami per collaborazioni.";
  const siteUrl =
    typeof window === "undefined"
      ? "https://adrian-gvr.github.io/webapp_with_chat/"
      : `${window.location.origin}${import.meta.env.BASE_URL}`;

  return (
    <Helmet>
      {/* Basic */}
      <title>{fullTitle}</title>
      <meta name="description" content={description || defaultDescription} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta
        property="og:description"
        content={description || defaultDescription}
      />
      {image && <meta property="og:image" content={image} />}
      <meta property="og:url" content={url || siteUrl} />
      <meta property="og:site_name" content={siteTitle} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta
        name="twitter:description"
        content={description || defaultDescription}
      />
      {image && <meta name="twitter:image" content={image} />}

      {/* Altri meta */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta charSet="utf-8" />
      <meta name="robots" content="index, follow" />
      <meta name="language" content="Italian" />
      <meta name="author" content="CreativePortfolio" />
    </Helmet>
  );
}

export default SEO;
