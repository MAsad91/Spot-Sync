import React, { useState, useEffect } from "react";
import Input from "@mui/material/Input";
import SearchIcon from "@mui/icons-material/Search";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import ClearIcon from "@mui/icons-material/Clear";

const SummarySearchBar = ({
    summaryList,
    setFilteredDetails,
}) => {
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const filterSubscriptions = () => {
            const normalizedSearchTerm = searchTerm.toLowerCase();

            const filtered = summaryList.filter((item) => {
                const { customerId, subscriptionId, } = item;
                const { firstName, lastName, email, mobile } =
                    customerId ?? {};
                const { subscriptionNumber } = subscriptionId ?? {};
                const fullName = `${firstName ?? ""} ${lastName ?? ""}`
                    .toLowerCase()
                    .trim();
                return (
                    fullName.includes(normalizedSearchTerm) ||
                    firstName?.toLowerCase().includes(normalizedSearchTerm) ||
                    lastName?.toLowerCase().includes(normalizedSearchTerm) ||
                    email?.toLowerCase().includes(normalizedSearchTerm) ||
                    mobile?.includes(normalizedSearchTerm) ||
                    subscriptionNumber
                        ?.toUpperCase()
                        .includes(searchTerm.toUpperCase())

                );
            });

            setFilteredDetails(filtered);
        };

        filterSubscriptions();
    }, [searchTerm, setFilteredDetails, summaryList]);

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    const clearSearch = () => {
        setSearchTerm("");
    };

    return (
        <>
            <Input
                placeholder="Search"
                value={searchTerm}
                onChange={handleSearch}
                endAdornment={
                    <InputAdornment position="end">
                        {searchTerm && (
                            <IconButton color="secondary" onClick={clearSearch} size="medium">
                                <ClearIcon />
                            </IconButton>
                        )}
                        <IconButton color="secondary" size="medium">
                            <SearchIcon />
                        </IconButton>
                    </InputAdornment>
                }
            ></Input>
        </>
    );
};

export default SummarySearchBar;
