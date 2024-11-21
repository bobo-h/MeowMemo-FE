import React, { useEffect, useState } from "react";
import { Row, Col } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import {
  getDiaryList,
  clearDiaryList,
  getFilterOptions,
} from "../../../features/diary/diarySlice";
import { ReactComponent as Up } from "../../../assets/up.svg";
import { ReactComponent as Down } from "../../../assets/down.svg";
import "../style/diaryListFilter.style.css";

const DiaryListFilter = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();

  const { filterOptions, loading } = useSelector((state) => state.diary);

  const [filters, setFilters] = useState({
    year: searchParams.get("year") || "",
    month: searchParams.get("month") || "",
  });

  const [dropdowns, setDropdowns] = useState({
    year: false,
    month: false,
  });

  const toggleDropdown = (name) => {
    setDropdowns((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));

    // URL 업데이트
    const updatedParams = new URLSearchParams(searchParams);
    if (value) {
      updatedParams.set(name, value);
    } else {
      updatedParams.delete(name);
    }
    setSearchParams(updatedParams);

    // 드롭다운 닫기
    setDropdowns((prev) => ({
      ...prev,
      [name]: false,
    }));
  };

  useEffect(() => {
    // 필터 옵션 데이터 로드
    dispatch(getFilterOptions());
  }, [dispatch]);

  useEffect(() => {
    // 필터 변경 시 상태 초기화 및 데이터 로드
    const { year, month } = filters;
    dispatch(clearDiaryList());
    dispatch(getDiaryList({ page: 1, year, month }));
  }, [dispatch, filters]);

  return (
    <div className="diary-filter-container">
      <div className="diary-filter">
        <div
          className={`diary-filter__label ${
            loading ? "diary-filter__label--disabled" : ""
          }`}
          onClick={() => !loading && toggleDropdown("year")}
        >
          <span>{filters.year || "Year"}</span>
          {dropdowns.year ? (
            <Up className="diary-filter__icon" />
          ) : (
            <Down className="diary-filter__icon" />
          )}
        </div>
        {dropdowns.year && (
          <div className="diary-filter__list">
            <div
              className="diary-filter__item"
              onClick={() => handleFilterChange("year", "")}
            >
              Year
            </div>
            {filterOptions.years.map((year) => (
              <div
                key={year}
                className="diary-filter__item"
                onClick={() => handleFilterChange("year", year)}
              >
                {year}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="diary-filter">
        <div
          className={`diary-filter__label ${
            loading ? "diary-filter__label--disabled" : ""
          }`}
          onClick={() => !loading && toggleDropdown("month")}
        >
          <span>{filters.month || "Month"}</span>
          {dropdowns.month ? (
            <Up className="diary-filter__icon" />
          ) : (
            <Down className="diary-filter__icon" />
          )}
        </div>
        {dropdowns.month && (
          <div className="diary-filter__list">
            <div
              className="diary-filter__item"
              onClick={() => handleFilterChange("month", "")}
            >
              Month
            </div>
            {filterOptions.months.map((month) => (
              <div
                key={month}
                className="diary-filter__item"
                onClick={() => handleFilterChange("month", month)}
              >
                {new Date(0, month - 1).toLocaleString("default", {
                  month: "long",
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DiaryListFilter;
