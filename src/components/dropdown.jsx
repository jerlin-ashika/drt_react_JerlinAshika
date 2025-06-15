import React, { useState, useRef, useEffect } from "react";

const DropdownFilter = ({ label, options, selected, setSelected }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleOption = (val) => {
    setSelected((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
    );
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="border  rounded-2xl min-w-64 border-gray-500 bg-primary py-2 px-3 py-1 rounded shadow"
      >
        {label} ({selected.length})
      </button>
      {open && (
        <div className="absolute z-10 mt-2 w-48 bg-white border rounded shadow text-black max-h-64 overflow-y-auto">
          {options.map((opt) => (
            <label
              key={opt}
              className="block px-4 py-2 text-sm hover:bg-gray-100"
            >
              <input
                type="checkbox"
                className="mr-2"
                checked={selected.includes(opt)}
                onChange={() => toggleOption(opt)}
              />
              {opt}
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default DropdownFilter;
