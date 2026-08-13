import React from "react";
import ReserveList from "@/features/reservation/components/desktop/ReserveList";
import { NextPage } from "next";

const ReserveListPage: NextPage = () => {
  return (
    <div className="flex flex-col">
      <ReserveList />
    </div>
  );
};

export default ReserveListPage;
