export default function AboutPage() {
  return (
    <div className="container mx-auto py-16 px-4 max-w-3xl">
      <h1 className="text-4xl font-bold mb-6 text-center">About EduLearn</h1>
      <p className="text-lg text-center mb-8">
        Welcome to EduLearn, your ultimate destination for interactive and
        personalized online learning. Our platform is designed to empower
        students, instructors, and institutions with a seamless digital learning
        experience that is engaging, effective, and accessible to all.
      </p>
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Our Vision</h2>
        <p>
          To transform education by bridging the gap between learners and
          quality educational content through innovation, technology, and
          user-centered design.
        </p>
      </section>
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Our Mission</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>Provide high-quality courses across diverse fields.</li>
          <li>Enable instructors to share their knowledge with ease.</li>
          <li>
            Support students with personalized learning paths, interactive
            coding exercises, and real-time progress tracking.
          </li>
          <li>
            Offer certifications that validate your skills and boost your
            career.
          </li>
        </ul>
      </section>
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">
          What Makes Us Different?
        </h2>
        <ul className="list-disc list-inside space-y-2">
          <li>
            <span className="font-medium">User-Centric Design:</span> An
            intuitive interface for both students and instructors.
          </li>
          <li>
            <span className="font-medium">Interactive Learning:</span> From
            coding practice to quizzes, learning is never dull.
          </li>
          <li>
            <span className="font-medium">Progress Tracking:</span> Keep tabs on
            your learning journey and achieve your goals.
          </li>
          <li>
            <span className="font-medium">Role-Based Experience:</span> Tailored
            dashboards for students, instructors, and administrators.
          </li>
          <li>
            <span className="font-medium">Secure & Scalable:</span> Built with
            robust technologies like Django, React, and SQLite to ensure
            performance and security.
          </li>
        </ul>
      </section>
      <section className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Join Us Today!</h2>
        <p>
          Whether you're a learner seeking knowledge, an educator wanting to
          share expertise, or an administrator managing learning workflows,
          EduLearn is here to support you. Let's shape the future of education,
          together.
        </p>
      </section>
    </div>
  );
}
