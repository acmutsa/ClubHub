"use client";

import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

interface AdminUserGraphProps  {
    data: {
        superAdminCount: number;
        adminCount: number;
        regularCount: number;
    };
}

export default function AdminUserChart({ data }: AdminUserGraphProps) {
    const total = data.superAdminCount + data.adminCount + data.regularCount;
    const chartData = [
        {
            name: "users",
            regular: data.regularCount,
            admin: data.adminCount,
            super_admin: data.superAdminCount,
        },
    ];
    const chartConfig = {
        regular: {
            label: "Regular",
            color: "var(--chart-1)",
        },
        admin: {
            label: "Admin",
            color: "var(--chart-2)",
        },
        super_admin: {
            label: "Super_Admin",
            color: "var(--chart-3)",
        },
    } satisfies ChartConfig;

    return (
    <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
            <CardTitle>ClubHub User Stats</CardTitle>
            <CardDescription>A collection of the overall users and count of roles</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-1 items-center pb-0">
            <ChartContainer
                config={chartConfig}
                className="mx-auto aspect-square w-full max-w-[250px] p-0"
            >
                <RadialBarChart
                    data={chartData}
                    endAngle={180}
                    innerRadius={80}
                    outerRadius={130}
                >
                    <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel />}
                    />
                    <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                        <Label
                            content={({ viewBox }) => {
                            if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                return (
                                    <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                                        <tspan
                                            x={viewBox.cx}
                                            y={(viewBox.cy || 0) - 16}
                                            className="fill-foreground text-2xl font-bold"
                                        >
                                            {total.toLocaleString()}
                                        </tspan>
                                        <tspan
                                            x={viewBox.cx}
                                            y={(viewBox.cy || 0) + 4}
                                            className="fill-muted-foreground"
                                        >
                                            Users
                                        </tspan>
                                    </text>
                                )
                            }
                        }}
                    />
                    </PolarRadiusAxis>
                    <RadialBar
                        dataKey="regular"
                        stackId="a"
                        cornerRadius={5}
                        fill="var(--chart-1)"
                        className="stroke-transparent stroke-2"
                    />
                    <RadialBar
                        dataKey="admin"
                        fill="var(--chart-2)"
                        stackId="a"
                        cornerRadius={5}
                        className="stroke-transparent stroke-2"
                    />
                    <RadialBar
                        dataKey="super_admin"
                        fill="var(--chart-3)"
                        stackId="a"
                        cornerRadius={5}
                        className="stroke-transparent stroke-2"
                    />
                </RadialBarChart>
            </ChartContainer>
        </CardContent>
        <CardFooter className="flex-col gap-2 text-sm">
            <div className="text-muted-foreground leading-none">
                Showing total users for ClubHub
            </div>
        </CardFooter>
    </Card>
  );
}