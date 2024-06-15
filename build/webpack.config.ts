import path from "path";
import { type Configuration } from "webpack";
import TerserPlugin from "terser-webpack-plugin";

const configuration: Configuration = 
{
    name: process.cwd().match(/([A-Za-z0-9\._-]+)$/)?.[1],
    mode: "production",
    entry: "./src/index.ts",
    module: 
    {
        rules: 
        [
            {
                test: /\.tsx?$/,
                use:
                {
                    loader: 'babel-loader',
                    options: 
                    {
                        presets: 
                        [
                            "@babel/preset-typescript",
                            [
                                "@babel/preset-env",
                                {
                                    targets: 
                                    {
                                        node: "16"
                                    }
                                }
                            ]
                        ]
                    }
                },
                exclude: /node_modules/
            }
        ],
    },
    optimization: 
    {
        minimize: true,
        minimizer: 
        [
            new TerserPlugin
            (
                {
                    extractComments: false,
                    terserOptions: 
                    {
                        format: 
                        {
                            comments: false,
                        }
                    }
                }
            )
        ]
    },
    resolve: 
    {
        extensions: [".tsx", ".ts", ".js"]
    },
    output: 
    {
        filename: "index.js",
        path: path.resolve(process.cwd(), "dist"),
        libraryTarget: "commonjs"
    },
    target: "node"
};

export default configuration;
