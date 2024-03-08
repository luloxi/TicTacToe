import React, { useState } from "react";
import { Box, Button, Checkbox, Input, Stack, Text } from "@chakra-ui/react";
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
    <Box width={"85%"}>
      <form onSubmit={handleSearch} className="flex items-center justify-end mb-5 space-x-3 mx-5">
        <Input
          type="text"
          value={input}
          placeholder="Search by gameId or address"
          onChange={e => setInput(e.target.value)}
          variant="flushed"
          focusBorderColor="#FF0000"
          _placeholder={{ opacity: 0.5, color: "gray.100" }}
        />
        <Button type="submit" variant="solid" backgroundColor={"red"} textColor={"white"} colorScheme="orange">
          Search
        </Button>
      </form>
      <Stack spacing={5} direction="row" justifyContent={"center"}>
        {searchFilters.map((filter, index) => (
          <Checkbox
            colorScheme="red"
            key={index}
            onChange={() => updateSearchFilters(index)}
            defaultChecked={filter?.selected}
          >
            <Text marginTop={0} color="red" as="i">
              {" "}
              {filter?.label}
            </Text>
          </Checkbox>
        ))}
      </Stack>
      <br />
      <hr />
    </Box>
  );
};
