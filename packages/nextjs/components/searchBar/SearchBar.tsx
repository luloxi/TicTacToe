import React, { useState } from "react";
import { Box, Checkbox, Stack } from "@chakra-ui/react";
import { isHex } from "viem";
import { SearchBarProps } from "~~/types/TicTacToeTypes";
import { notification } from "~~/utils/scaffold-eth";

export const SearchBar: React.FC<SearchBarProps> = ({ searchFilters, updateSearchFilters, updateSearchInput }) => {
  const [input, setInput] = useState<string>("");

  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    if (input === "" || !isNaN(parseInt(input)) || isHex(input)) {
      updateSearchInput(input);
    } else {
      notification.error("Check your input for correctness");
    }
  };

  return (
    <Box width={"75%"}>
      <form onSubmit={handleSearch} className="flex items-center justify-end mb-5 space-x-3 mx-5">
        <input
          className="border-primary bg-base-100 text-base-content p-2 mr-2 w-full rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-accent"
          type="text"
          value={input}
          placeholder="Search by gameId or address"
          onChange={e => setInput(e.target.value)}
        />
        <button className="btn btn-sm btn-primary" type="submit">
          Search
        </button>
      </form>
      <Stack spacing={5} direction="row">
        {searchFilters.map((filter, index) => (
          <Checkbox key={index} onChange={() => updateSearchFilters(index)} defaultChecked={filter?.selected}>
            {filter?.label}
          </Checkbox>
        ))}
      </Stack>
    </Box>
  );
};
