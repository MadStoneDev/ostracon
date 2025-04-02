import React from "react";

import SingleUser from "@/components/feed/single-user";
import ReportForm from "@/components/ui/report-form";

export default async function ReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Variables
  const userId = (await params).id;

  return (
    <div className={`grid z-0`}>
      <section
        className={`pb-4 border-b border-dark/20 dark:border-light/20 transition-all duration-300 ease-in-out`}
      >
        <h1 className={`text-xl font-bold`}>Report</h1>
      </section>

      <section className={`py-4 scale-90 opacity-70`}>
        <SingleUser userId={userId} referenceOnly={true} />
      </section>

      <section
        className={`pt-4 pb-[70px] border-t border-dark/20 dark:border-light/20 transition-all duration-300 ease-in-out`}
      >
        <h2 className={`font-bold`}>Why are you reporting this user?</h2>
        <ReportForm />
      </section>
    </div>
  );
}
