const Users = require("../../../models/users");
const Brands = require("../../../models/brands");
const {
    http400,
    http200,
    http403,
} = require("../../../global/errors/httpCodes");
const {
    isValidObjectId,
} = require("mongoose");
const { DOC_STATUS } = require("../../../constants");

module.exports = {
    async getExportUsers(req, res) {
        let success = false;
        try {
            const { userId } = req;
            if (!userId || !isValidObjectId(userId))
                return res.status(http403).json({
                    success,
                    message: "Invalid Token",
                });

            const brands = await Brands.find({ status: { $ne: DOC_STATUS.DELETE } });

            const users = await Users.find(
                { status: { $ne: DOC_STATUS.DELETE } },
                { password: 0 }
            )
                .populate({
                    path: "locations",
                    match: { status: 10 }, // Only Active locations
                    options: {
                        projection: { parkingCode: 1 },
                    },
                    populate: {
                        path: "brandId",
                    },
                })
                .populate({
                    path: "roleId",
                })
                .populate({
                    path: "creatorId",
                    match: { status: 10 },
                    options: {
                        projection: { email: 1, mobile: 1 },
                    },
                    populate: {
                        path: "roleId",
                    },
                })
                .exec();

            const filteredUsers = users.filter((u) => u.creatorId?.roleId.level === 90);

            const filteredData = filteredUsers.map((user) => {
                const matchingBrand = brands.find(
                    (brand) =>
                        brand.ownerEmail === user.creatorId.email ||
                        brand.ownerMobileNumber === user.creatorId.mobile
                );

                const userObject = {
                    "Short Brand Name": matchingBrand ? matchingBrand.shortBrandName : null,
                    "Brand Name": matchingBrand ? matchingBrand.brandName : null,
                    "Brand Address": matchingBrand ? matchingBrand.brandAddress : null,
                    "User Name": user.firstName + " " + user.lastName || null,
                    "User Email": user.email || null,
                    "User Mobile": user.mobile || null,
                    "User Role": user.roleId?.title || null,
                    "Locations": user.locations && user.locations.length > 0
                        ? user.locations.map(location => location.parkingCode).join(', ')
                        : '',
                };

                return userObject;
            });

            return res.status(http200).json({
                success: true,
                message: "Success",
                users: filteredData,
            });
        } catch (error) {
            return res.status(http400).json({
                success,
                message: error?.message || "Something went wrong!",
            });
        }
    },
};