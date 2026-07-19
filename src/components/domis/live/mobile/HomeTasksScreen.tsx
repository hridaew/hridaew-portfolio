"use client";

import type { CSSProperties } from "react";
import { DomisLiveIcon } from "@/components/domis/live/DomisLiveIcon";
import { TaskCard, type TaskCardChip } from "@/components/domis/live/mobile/TaskCard";
import {
  ADDRESS_ASSETS,
  ADDRESS_FULL,
  INSPECTION_TASKS,
  type InspectionTask,
} from "@/components/domis/live/fixtures";
import "./home-tasks-screen.css";

function chipsForTask(task: InspectionTask): TaskCardChip[] {
  const chips: TaskCardChip[] = [];

  if (task.location) {
    chips.push({
      id: `${task.id}-loc`,
      label: task.location,
      icon: "location_on",
      variant: "location",
    });
  }

  if (task.completedAtLabel) {
    chips.push({
      id: `${task.id}-done`,
      label: task.completedAtLabel,
      variant: "default",
    });
  }

  return chips;
}

const TABS = ["Open", "Done", "All"] as const;

export type HomeTasksScreenProps = {
  className?: string;
  style?: CSSProperties;
};

/**
 * Domis home tasks page — Fillmore Home with populated task cards.
 */
export function HomeTasksScreen({ className, style }: HomeTasksScreenProps) {
  return (
    <div
      className={["domis-live", "hts", className].filter(Boolean).join(" ")}
      style={style}
      aria-label="Domis home tasks"
    >
      <header className="hts-top">
        <div className="hts-home">
          <img
            className="hts-avatar"
            src={ADDRESS_ASSETS.homeAvatar}
            alt=""
            draggable={false}
          />
          <div className="hts-home-copy">
            <p className="hts-home-name">Fillmore Home</p>
            <p className="hts-home-addr">{ADDRESS_FULL}</p>
          </div>
        </div>
        <span className="hts-icon-btn" aria-hidden>
          <DomisLiveIcon name="search" size={22} color="#525252" />
        </span>
      </header>

      <div className="hts-heading">
        <p className="hts-title">Tasks</p>
        <p className="hts-count">{INSPECTION_TASKS.length} tasks</p>
      </div>

      <div className="hts-tabs" aria-hidden>
        {TABS.map((tab, i) => (
          <span
            key={tab}
            className="hts-tab"
            data-active={i === 0 ? "true" : "false"}
          >
            {tab}
          </span>
        ))}
      </div>

      <div className="hts-list">
        {INSPECTION_TASKS.map((task) => (
          <TaskCard
            key={task.id}
            title={task.title}
            chips={chipsForTask(task)}
            thumbSrc={task.thumbSrc}
            thumbAlt=""
            muted={task.muted}
          />
        ))}
      </div>
    </div>
  );
}
