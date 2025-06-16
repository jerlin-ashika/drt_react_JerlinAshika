import React, { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { assetService } from "../../services/assets";
import { FixedSizeList as List } from "react-window";
import DropdownFilter from "../../components/dropdown";
import {
  AssetAttributes,
  AssetObjectDataTypes,
  AssetObjectTypes,
  AssetOrbitCode,
} from "../../utils/variables";

const AssetList = () => {
  const [objectTypes, setObjectType] = useState(AssetObjectTypes);
  const [currentState, setCurrentState] = useState("All Objects");
  const [dataCount, setDataCount] = useState(AssetObjectDataTypes);
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [allData, setAllData] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [selectedOrbitCodes, setSelectedOrbitCodes] = useState([]);
  const [selectedObjectTypes, setSelectedObjectTypes] = useState([]);

  const {
    data: assetList,
    isError,
    isLoading,
  } = useQuery({
    queryFn: () =>
      assetService.getAll({
        objectTypes: objectTypes.join(","),
        attributes: AssetAttributes.join(","),
      }),
    queryKey: ["assetList", objectTypes, AssetAttributes],
    enabled: objectTypes.length > 0 && AssetAttributes?.length > 0,
  });

  useEffect(() => {
    if (!assetList?.data?.data || currentState !== "All Objects") return;
    const allItems = assetList.data.data;
    const counts = {
      All: allItems.length,
      PAYLOAD: 0,
      DEBRIS: 0,
      "ROCKET BODY": 0,
      UNKNOWN: 0,
    };
    allItems.forEach((item) => {
      const type = item.objectType?.toUpperCase() || "UNKNOWN";
      if (counts[type] !== undefined) {
        counts[type]++;
      } else {
        counts.UNKNOWN++;
      }
    });
    setAllData(allItems);
    setDataCount((prev) =>
      prev.map((item) => {
        switch (item.name) {
          case "All Objects":
            return { ...item, value: counts.All };
          case "Payloads":
            return { ...item, value: counts.PAYLOAD };
          case "Debris":
            return { ...item, value: counts.DEBRIS };
          case "Rocket Bodies":
            return { ...item, value: counts["ROCKET BODY"] };
          case "Unknown":
            return { ...item, value: counts.UNKNOWN };
          default:
            return item;
        }
      })
    );
  }, [assetList]);

  useEffect(() => {
    if (!assetList?.data?.data) return;

    const lowerSearch = searchTerm.toLowerCase();

    const result = assetList.data.data.filter((item) => {
      return (
        item.name?.toLowerCase().includes(lowerSearch) ||
        item.noradCatId?.toLowerCase().includes(lowerSearch)
      );
    });

    setFilteredData(result);
  }, [searchTerm, assetList]);

  const sortedData = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return [];

    return [...filteredData].sort((a, b) => {
      const valA = a[sortBy]?.toLowerCase?.() || a[sortBy] || "";
      const valB = b[sortBy]?.toLowerCase?.() || b[sortBy] || "";

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortBy, sortOrder]);
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };
  const handleApplyFilter = () => {
    const lowerSearch = searchTerm.toLowerCase();

    const filtered = allData.filter((item) => {
      const nameMatch = item.name?.toLowerCase().includes(lowerSearch);
      const idMatch = item.noradCatId?.toLowerCase().includes(lowerSearch);

      const objectMatch =
        selectedObjectTypes.length === 0 ||
        selectedObjectTypes.includes(item.objectType);

      const orbitMatch =
        selectedOrbitCodes.length === 0 ||
        selectedOrbitCodes.includes(item.orbitCode?.replace(/[{}]/g, ""));

      return (nameMatch || idMatch) && objectMatch && orbitMatch;
    });
    setFilteredData(filtered);
  };

  return (
    <>
      <div className="min-h-screen bg-primary text-font_primary p-5">
        <h1 className="text-2xl text-start font-bold py-4 pb-5">
          Create My Asset List
        </h1>
        <div className="flex gap-5 pb-3 flex-wrap">
          {dataCount?.map((dt) => (
            <div
              key={dt?.id}
              className={`border cursor-pointer ${
                currentState === dt?.name && "border-secondary"
              } rounded-2xl px-5 `}
              onClick={() => {
                setObjectType(dt?.objectType);
                setCurrentState(dt?.name);
              }}
            >
              <div className="py-1 flex justify-center items-center gap-2">
                <div className={`p-1 ${dt?.className} rounded-2xl`} />
                {dt?.name} {dt?.value ? `(${dt?.value})` : ""}
              </div>
            </div>
          ))}
        </div>
        <div className="flex  mb-5 gap-4 flex-wrap">
          <input
            type="text"
            placeholder="Search by name/NORAD ID"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setSearchTerm(inputValue);
              }
            }}
            className="p-2  border rounded bg-primary rounded-2xl min-w-64 border-gray-500"
          />
          <DropdownFilter
            label="Object Types"
            options={["ROCKET BODY", "DEBRIS", "UNKNOWN", "PAYLOAD"]}
            selected={selectedObjectTypes}
            setSelected={setSelectedObjectTypes}
          />

          <DropdownFilter
            label="Orbit Codes"
            options={AssetOrbitCode}
            selected={selectedOrbitCodes}
            setSelected={setSelectedOrbitCodes}
          />
          <button
            onClick={() => handleApplyFilter()}
            className="bg-secondary text-white rounded-2xl px-4 py-2 h-max"
          >
            Apply Filters
          </button>
        </div>
        <div className="overflow-x-auto custom-scroll">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : isError ? (
            <div className="flex justify-center items-center h-64 text-red-500 font-semibold">
              Failed to load assets. Please try again later.
            </div>
          ) : sortedData.length === 0 ? (
            <div className="flex justify-center items-center h-64 text-gray-400 italic">
              No results match your filters.
            </div>
          ) : (
            <div>
              <div
                className={`hidden md:grid  ${
                  window.innerWidth < 768
                    ? "grid-cols-[130px_200px_160px_120px_120px_100px]"
                    : "grid-cols-[1fr_2fr_2fr_1.5fr_1.5fr_1fr]"
                }  bg-primary px-4 py-2 text-sm font-semibold text-font_primary`}
              >
                <div
                  className="text-start cursor-pointer text-gray-500"
                  onClick={() => handleSort("noradCatId")}
                >
                  NORAD ID{" "}
                  {sortBy === "noradCatId" && (sortOrder === "asc" ? "↑" : "↓")}
                </div>
                <div
                  className="text-start cursor-pointer text-gray-500"
                  onClick={() => handleSort("name")}
                >
                  Name {sortBy === "name" && (sortOrder === "asc" ? "↑" : "↓")}
                </div>
                <div
                  className="text-start cursor-pointer text-gray-500"
                  onClick={() => handleSort("launchDate")}
                >
                  COSPAR ID{" "}
                  {sortBy === "launchDate" && (sortOrder === "asc" ? "↑" : "↓")}
                </div>
                <div className="text-start text-gray-500">Regime</div>
                <div
                  className="text-center cursor-pointer text-gray-500"
                  onClick={() => handleSort("countryCode")}
                >
                  Country{" "}
                  {sortBy === "countryCode" &&
                    (sortOrder === "asc" ? "↑" : "↓")}
                </div>
                <div className="text-center text-gray-500">Status</div>
              </div>

              <List
                height={450}
                itemCount={sortedData.length}
                itemSize={50}
                width="100%"
                className="custom-scroll"
              >
                {({ index, style }) => {
                  const satellite = sortedData[index];
                  return (
                    <div
                      key={satellite.noradCatId}
                      style={style}
                      className={`grid ${
                        window.innerWidth < 768
                          ? "grid-cols-[130px_200px_160px_120px_120px_100px]"
                          : "grid-cols-[1fr_2fr_2fr_1.5fr_1.5fr_1fr]"
                      } px-4 py-2 text-sm items-center hover:bg-secondary transition-colors`}
                    >
                      <div className="text-start">
                        {satellite.noradCatId ?? "-"}
                      </div>
                      <div className="text-start">{satellite.name ?? "-"}</div>
                      <div className="text-start">
                        {satellite.launchDate ?? "-"}
                      </div>
                      <div className="text-start">
                        {satellite.orbitCode
                          ? satellite.orbitCode.replace(/[{}]/g, "")
                          : "-"}
                      </div>
                      <div className="text-center ">
                        {satellite.countryCode ?? "-"}
                      </div>
                      <div className="text-center ml-5">
                        <span
                          className={`inline-flex p-2 rounded-full text-xs font-medium ${
                            satellite.objectType === "DEBRIS"
                              ? "bg-green-500"
                              : satellite.objectType === "ROCKET BODY"
                              ? "bg-yellow-400"
                              : satellite.objectType === "PAYLOAD"
                              ? "bg-gray-100"
                              : satellite.objectType === "UNKNOWN"
                              ? "bg-red-500"
                              : "bg-secondary"
                          }`}
                        >
                          {satellite.status}
                        </span>
                      </div>
                    </div>
                  );
                }}
              </List>
            </div>
          )}
        </div>{" "}
      </div>
    </>
  );
};
export default AssetList;
