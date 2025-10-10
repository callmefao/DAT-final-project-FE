const TEAM_MEMBERS = [
  {
    name: "Nguyen Van A",
    role: "Team Leader",
    image: "https://via.placeholder.com/120"
  },
  {
    name: "Tran Thi B",
    role: "Frontend Developer",
    image: "https://via.placeholder.com/120"
  },
  {
    name: "Le Van C",
    role: "Backend Developer",
    image: "https://via.placeholder.com/120"
  },
  {
    name: "Pham Thi D",
    role: "AI Engineer",
    image: "https://via.placeholder.com/120"
  },
  {
    name: "Hoang Van E",
    role: "UI/UX Designer",
    image: "https://via.placeholder.com/120"
  }
];

const HomePage = () => {
  return (
    <div className="space-y-12">
      <section className="rounded-3xl bg-gradient-to-r from-primary/10 via-white to-secondary/10 p-10 text-slate-800 shadow-inner">
        <h1 className="text-4xl font-bold text-primary">Group 2 Voice Technology</h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-700">
          We are Group 2. This project showcases AI applications that use voice technology.
        </p>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-slate-800">Meet the team</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TEAM_MEMBERS.map((member) => (
            <article
              key={member.name}
              className="flex flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-lg shadow-slate-200/70 transition hover:-translate-y-1 hover:shadow-xl"
            >
              <span className="h-24 w-24 overflow-hidden rounded-full border-4 border-primary/20 bg-slate-100">
                <img src={member.image} alt={member.name} className="h-full w-full object-cover" />
              </span>
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-slate-900">{member.name}</h3>
                <p className="text-sm text-primary">{member.role}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
