import mongoose from "mongoose";
import fs from "node:fs/promises";
import dotenv from "dotenv";
import dns from "node:dns";

dns.setDefaultResultOrder("ipv4first");
dns.setServers(["8.8.8.8", "8.8.4.4"]);


dotenv.config({
    path: ".env"
});

const applicationSchema = new mongoose.Schema({
    student: String,
    company: String,
    status: {
        type: String,
        enum: ["selected", "rejected", "pending"]
    },
    package: Number
});

const Application = mongoose.model("Application", applicationSchema);

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        console.log("MongoDB connected");

        const rawData = await fs.readFile("./data.json", "utf-8");
        const data = JSON.parse(rawData);

        await Application.deleteMany({});
        await Application.insertMany(data);

        console.log("Practice data inserted:", data.length);

        // AGGREGATION PIPELINES GO HERE
        // const statusStats = await Application.aggregate([
        //     {
        //         $match: {
        //             status: "selected"
        //         }
        //     }, {
        //         $group: {
        //             _id: "$company",
        //             students: {
        //                 $addToSet: "$student"
        //             }
        //         }
        //     }, {
        //         $project: {
        //             _id: 1,
        //             totalStudent: {
        //                 $size: "$students"
        //             }
        //         }
        //     }, {
        //         $sort: {
        //             totalStudent: -1
        //         }
        //     }, {
        //         $limit: 3
        //     }
        // ])

        // console.log(statusStats);


        // const companyStats = await Application.aggregate([
        //     {
        //         $group: {
        //             _id: "$company",

        //             totalApplications: {
        //                 $sum: 1
        //             },

        //             totalSelected: {
        //                 $sum: {
        //                     $cond: [
        //                         { $eq: ["$status", "selected"] },
        //                         1,
        //                         0
        //                     ]
        //                 }
        //             },

        //             totalRejected: {
        //                 $sum: {
        //                     $cond: [
        //                         { $eq: ["$status", "rejected"] },
        //                         1,
        //                         0
        //                     ]
        //                 }
        //             },

        //             totalPending: {
        //                 $sum: {
        //                     $cond: [
        //                         { $eq: ["$status", "pending"] },
        //                         1,
        //                         0
        //                     ]
        //                 }
        //             }
        //         }
        //     },
        //     {
        //         $project: {
        //             _id: 0,
        //             company: "$_id",
        //             totalApplications: 1,
        //             totalSelected: 1,
        //             totalRejected: 1,
        //             totalPending: 1
        //         }
        //     }
        // ]);
        // console.log(companyStats);

        const allApplicationDocuments = await Application.aggregate([
            {
                $facet: {
                    topCompanies: [
                        {
                            $match: {
                                status: "selected"
                            }
                        }, {
                            $group: {
                                _id: "$company",
                                students: {
                                    $addToSet: "$student"
                                }
                            }
                        }, {
                            $project: {
                                _id: 1,
                                totalStudent: {
                                    $size: "$students"
                                }
                            }
                        }, {
                            $sort: {
                                totalStudent: -1
                            }
                        }, {
                            $limit: 3
                        }

                    ],
                    companyStats: [
                        {
                            $group: {
                                _id: "$company",

                                totalApplications: {
                                    $sum: 1
                                },

                                totalSelected: {
                                    $sum: {
                                        $cond: [
                                            { $eq: ["$status", "selected"] },
                                            1,
                                            0
                                        ]
                                    }
                                },

                                totalRejected: {
                                    $sum: {
                                        $cond: [
                                            { $eq: ["$status", "rejected"] },
                                            1,
                                            0
                                        ]
                                    }
                                },

                                totalPending: {
                                    $sum: {
                                        $cond: [
                                            { $eq: ["$status", "pending"] },
                                            1,
                                            0
                                        ]
                                    }
                                }
                            }
                        },
                        {
                            $project: {
                                _id: 0,
                                company: "$_id",
                                totalApplications: 1,
                                totalSelected: 1,
                                totalRejected: 1,
                                totalPending: 1
                            }
                        }
                    ]

                }
            }
        ])
        console.dir(allApplicationDocuments, { depth: null });

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
        console.log("MongoDB disconnected");
    }
};

run();