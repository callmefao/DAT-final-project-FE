import gold1 from "../../assets/member_avatar/gold_1.jpg";
import gold2 from "../../assets/member_avatar/gold_2.png";
import gold3 from "../../assets/member_avatar/gold_3.jpg";
import gold4 from "../../assets/member_avatar/gold_4.png";
import gold5 from "../../assets/member_avatar/gold_5.png";

const TEAM_MEMBERS = [
  {
    name: "Hữu Nhân",
    role: "Leader",
    image: gold3
  },
  {
    name: "Như Quỳnh",
    role: "",
    image: gold1
  },
  {
    name: "Anh Phương",
    role: "",
    image: gold2
  },
  {
    name: "Văn Phong",
    role: "",
    image: gold4
  },
  {
    name: "Anh Khoa",
    role: "",
    image: gold5
  }
];

const HomePage = () => {
  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-gradient-to-r from-primary/10 via-white to-secondary/10 p-8 shadow-inner lg:p-10">
        <div className="flex flex-col items-center text-center">
          <h1 className="text-3xl font-bold text-primary lg:text-4xl">Group 2 Voice Technology</h1>
          <p className="mt-4 max-w-2xl text-sm text-slate-700 lg:text-base">
            We are Group 2. This project showcases AI applications that use voice technology.
          </p>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex justify-center">
          <h2 className="text-2xl font-bold text-slate-900 bg-white px-6 py-3 rounded-2xl shadow-lg inline-block">Meet the team</h2>
        </div>
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
                {member.role && <p className="text-sm text-primary">{member.role}</p>}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
