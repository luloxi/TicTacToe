import React from "react";
import { Box, Checkbox, Stack } from "@chakra-ui/react";
import { SearchBarProps } from "~~/types/TicTacToeTypes";

export const SearchBar: React.FC<SearchBarProps> = ({ searchFilters, updateSearchFilters }) => {
  //   const [searchInput, setSearchInput] = useState("");

  //   const client = usePublicClient({ chainId: hardhat.id });

  //   const handleSearch = async (event: React.FormEvent) => {
  //     event.preventDefault();
  //     if (isHex(searchInput)) {
  //       try {
  //         const tx = await client.getTransaction({ hash: searchInput });
  //         // if (tx) {
  //         //   router.push(`/blockexplorer/transaction/${searchInput}`);
  //         //   return;
  //         // }
  //       } catch (error) {
  //         console.error("Failed to fetch transaction:", error);
  //       }
  //     }

  // if (isAddress(searchInput)) {
  //   router.push(`/blockexplorer/address/${searchInput}`);
  //   return;
  // }
  //   };

  return (
    <Box>
      {/* <form onSubmit={handleSearch} className="flex items-center justify-end mb-5 space-x-3 mx-5">
        <input
          className="border-primary bg-base-100 text-base-content p-2 mr-2 w-full md:w-1/2 lg:w-1/3 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-accent"
          type="text"
          value={searchInput}
          placeholder="Search by hash or address"
          onChange={e => setSearchInput(e.target.value)}
        />
        <button className="btn btn-sm btn-primary" type="submit">
          Search
        </button>
      </form> */}
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
