import JobListItems from "@/components/JobListItems";
import prisma from "@/lib/prisma";

export default async function Home() {
  // Fetch all approved jobs in the desc order of the date they are created at.
  const jobs = await prisma.job.findMany({
    where: { approved: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="m-auto my-10 max-w-5xl space-y-10 px-3">
      <div className="space-y-5 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          Developer Jobs
        </h1>
        <p className="text-muted-foreground">Find your dream job</p>
      </div>
      <section>
        <div className="space-y-4">
          {jobs.map((job) => (
            <JobListItems key={job.id} job={job} />
          ))}
        </div>
      </section>
    </main>
  );
}
