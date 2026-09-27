import React, { useState } from 'react';

const SortableTable = ({
  columns,
  data,
  isFilterColumn = true,
  onRowClick,
  close,
  checkboxes = {},
  onCheckboxChange, 
  rowWrap = true,
  tdclass,
}) => {
  const [filters, setFilters] = useState({});
  const handleFilterChange = (field, value) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [field]: value === 'All' ? null : value,
    }));
  };

  // ফিল্টারিং লজিক (অপরিবর্তিত)
  const filteredData = data && data.filter((row) =>
    columns.every((column) => {
      // console.log(column.field);
      // console.log(!filters[column.field] && filters[column.field] !== 0);
      
      if (!filters[column.field] && filters[column.field] !== 0) return true;

      if (column.type === 'text') {
        // console.log("called");
        
        return row[column.field]
          ?.toString()
          .toLowerCase()
          .includes(filters[column.field].toLowerCase());
      }
      if (column.type === 'select') {
        return row[column.field] === Number(filters[column.field]);
      }
      if (column.type === 'date') {
        const rowDate = new Date(row[column.field]).setHours(0, 0, 0, 0);
        const filterDate = new Date(filters[column.field]).setHours(0, 0, 0, 0);
        return rowDate === filterDate;
      }
      if (column.type === 'range') {
        const rowDate = new Date(row[column.field]).setHours(0, 0, 0, 0);
        const [startDate, endDate] = filters[column.field] || [];
        return startDate && endDate
          ? rowDate >= new Date(startDate).setHours(0, 0, 0, 0) &&
              rowDate <= new Date(endDate).setHours(0, 0, 0, 0)
          : true;
      }
      return true;
    })
  );
  const alignClass = {
    start: 'text-left',
    center: 'text-center',
    end: 'text-right',
  };
  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <table className="table__content min-w-full text-sm w-full"  role="grid" tabIndex={-1}>
        <thead className={`table__header border-b border-border bg-surface-secondary/60`} role="grid">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                className={`table__column px-3 py-3 text-[16px] font-semibold text-muted whitespace-nowrap rounded-none sm:px-4 text-left ${
                  alignClass[column.hozAlign] || 'text-left'
                }`}
              >
                <div className='inline-flex w-full items-center gap-1 justify-start'>
                  <span>{column.title}</span>
                  {column.hasCheckbox && onCheckboxChange && (
                    <input
                      type="checkbox"
                      checked={checkboxes[column.field] || false}
                      onChange={() => onCheckboxChange(column.field)}
                      className="ml-2"
                    />
                  )}
                </div>
              </th>
            ))}
          </tr>

          {isFilterColumn && (
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={`px-3 h-[40px] text-${column.hozAlign || 'start'}`}
                >
                  {column.filterable && (
                    <>
                      {column.type === 'text' && (
                        <input
                          type="text"
                          placeholder={`Filter ${column.title}`}
                          className="w-full h-[80%] px-2 py-1 outline-1 border border-gray-300 outline-theme-color rounded-[5px] text-xs font-normal"
                          value={filters[column.field] || ''}
                          onChange={(e) =>
                            handleFilterChange(column.field, e.target.value)
                          }
                        />
                      )}
                      {column.type === 'select' && (
                        <select
                          className="w-full h-[80%] px-2 py-1 outline-1 border border-gray-300 outline-theme-color rounded-[5px] text-xs font-normal"
                          value={filters[column.field] ?? 'All'}
                          onChange={(e) =>
                            handleFilterChange(
                              column.field,
                              e.target.value === 'All'
                                ? null
                                : Number(e.target.value)
                            )
                          }
                        >
                          <option value="All">All</option>
                          {column.options.map((option, i) => (
                            <option key={i} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      )}
                      {column.type === 'date' && (
                        <input
                          type="date"
                          className="w-full h-[80%] px-2 py-1 outline-1 border border-gray-300 outline-theme-color rounded-[5px] text-xs font-normal"
                          value={filters[column.field] || ''}
                          onChange={(event) =>
                            handleFilterChange(column.field, event.target.value)
                          }
                        />
                      )}
                      {column.type === 'range' && (
                        <div className="flex gap-1">
                          <input
                            type="date"
                            aria-label={`Start ${column.title}`}
                            className="w-1/2 h-[80%] px-1 py-1 outline-1 border border-gray-300 outline-theme-color rounded-[5px] text-xs font-normal"
                            value={filters[column.field]?.[0] || ''}
                            onChange={(event) =>
                              handleFilterChange(column.field, [event.target.value, filters[column.field]?.[1] || ''])
                            }
                          />
                          <input
                            type="date"
                            aria-label={`End ${column.title}`}
                            className="w-1/2 h-[80%] px-1 py-1 outline-1 border border-gray-300 outline-theme-color rounded-[5px] text-xs font-normal"
                            value={filters[column.field]?.[1] || ''}
                            onChange={(event) =>
                              handleFilterChange(column.field, [filters[column.field]?.[0] || '', event.target.value])
                            }
                          />
                        </div>
                      )}
                    </>
                  )}
                </th>
              ))}
            </tr>
          )}
        </thead>
        <tbody className='table__body divide-y divide-border'>
          {filteredData && filteredData.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className="table__row hover:bg-brand-50/20 transition-colors"
              onClick={() => onRowClick && onRowClick(row)}
            >
              {columns.map((column, cellIndex) => (
                <td
                  key={cellIndex}
                  className={`ptable__cell px-3 py-3 text-foreground align-middle sm:px-4 text-left text-[17px] ${rowWrap ? 'whitespace-nowrap' : 'whitespace-wrap'}  font-default text-${
                    column.hozAlign || 'start'
                  } ${tdclass}`}
                >
                  {column.render
                    ? column.render(row, rowIndex)
                    : row[column.field] || 'N/A'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SortableTable;
