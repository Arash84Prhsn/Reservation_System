import { EventInput } from "@fullcalendar/core/index.js";

// home 
export type ChairState = {
  chairType: "A" | "B" | "C";
  chairNumber: number;
};

export interface CalendarEvent extends EventInput {
  extendedProps?: {
    calendar?: string;
    chair?: ChairState;
  };
}