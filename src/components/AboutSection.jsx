function AboutSection() {
  return (
    <section id="about" className="about-section">

      <div className="about-container">

        <div className="about-image">

          <img
            src="https://images.unsplash.com/photo-1488085061387-422e29b40080"
            alt="Travel"
          />

        </div>


        <div className="about-content">

          <p className="small-title">
            ABOUT US
          </p>

          <h2>
            Making Your Journey
            Unforgettable
          </h2>

          <p>
            At Travelia, we believe that travel is more
            than visiting a new place. It is about
            discovering new experiences, meeting people
            and creating memories that last forever.
          </p>

          <p>
            We help travelers discover beautiful
            destinations and carefully planned travel
            packages designed for memorable journeys.
          </p>


          <div className="about-features">

            <div>
              <strong>50+</strong>
              <span>Destinations</span>
            </div>

            <div>
              <strong>1000+</strong>
              <span>Happy Travelers</span>
            </div>

            <div>
              <strong>5+</strong>
              <span>Years Experience</span>
            </div>

          </div>

        </div>

      </div>

    </section>
  );
}

export default AboutSection;