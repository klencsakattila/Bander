import "./AboutPage.css";
import React from "react";

export default function AboutPage() {
  return (
    <div className="about-page">
      <div className="about-card">
        <h1 className="about-title">About Bander</h1>

        <div className="about-text">
          <p>
            Bander is a web platform created to bring musicians together and inspire
            collaboration. Whether you’re a solo artist looking for bandmates or part of a
            group searching for new members, Bander makes it easy to connect with the
            right people.
          </p>

          <p>
            With smart filters for genre, instrument, and location, you can quickly find
            musicians or bands that match your style. Each user can create a detailed
            profile, join existing groups, or start their own band where they can manage
            members, share updates, and promote concerts or open positions.
          </p>

          <p>
            Bander also includes a built-in messaging system that allows direct
            communication between users — perfect for planning rehearsals,
            collaborations, or simply networking with other artists.
          </p>

          <p>
            Community safety is a top priority: moderators ensure that interactions remain
            respectful and the platform stays a positive space for all musicians.
          </p>

          <p>
            Future updates aim to expand the experience even further, including
            integrations with Google and SoundCloud accounts, as well as group chat
            features for easier collaboration.
          </p>

          <p>
            Our mission is to build a stable, secure, and evolving platform that supports
            musicians in finding each other, forming bands, and creating great music
            together.
          </p>
        </div>

        <div className="about-footer">
          <span>Download the Terms and Conditions below</span>
          <a
            className="about-link"
            href="/terms-and-conditions.pdf"
            download
          >
            Terms and Conditions
          </a>
        </div>
      </div>
    </div>
  );
}
