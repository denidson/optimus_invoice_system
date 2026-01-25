import React from "react";
import PropTypes from "prop-types";

export default function CardStats({
  statSubtitle,
  statTitle,
  statArrow,
  statPercent,
  statPercentColor,
  statDescripiron,
  statIconName,
  statIconColor,
  className = "",
}) {
  return (
    <div
      className={`relative flex flex-col h-full min-w-0 bg-white rounded shadow-lg ${className}`}
    >
      <div className="flex-auto p-4 flex flex-col justify-between">
        {/* Contenido principal */}
        <div className="flex flex-wrap items-start gap-y-2">
          {/* Texto */}
          <div className="flex-1 min-w-0 pr-4">
            <h5 className="text-blueGray-400 uppercase font-bold text-xs">
              {statSubtitle}
            </h5>

            <span
              className="
                block
                font-bold
                text-blueGray-700
                whitespace-nowrap
                leading-tight
                text-[clamp(1.35rem,2.3vw,2rem)]
              "
            >
              {statTitle}
            </span>
          </div>

          {/* Ícono */}
          <div className="flex-shrink-0 ml-auto">
            <div
              className={
                "text-white inline-flex items-center justify-center w-12 h-12 shadow-lg rounded-full " +
                statIconColor
              }
            >
              <i className={statIconName}></i>
            </div>
          </div>
        </div>

        {/* Footer */}
        {(statPercent || statDescripiron) && (
          <p className="text-sm text-blueGray-400 mt-4 flex items-center flex-wrap">
            <span className={`${statPercentColor} mr-2 whitespace-nowrap`}>
              <i
                className={
                  statArrow === "up"
                    ? "fas fa-arrow-up"
                    : statArrow === "down"
                    ? "fas fa-arrow-down"
                    : ""
                }
              ></i>{" "}
              {statPercent}%
            </span>
            <span className="break-words">{statDescripiron}</span>
          </p>
        )}
      </div>
    </div>
  );
}
