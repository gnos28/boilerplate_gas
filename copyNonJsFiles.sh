#!/bin/bash

# Source directory containing HTML files and subfolders
source_dir="./src"

# Destination directory where HTML files will be copied
destination_dir="./build"

# Remove previous html files
find "$destination_dir" -type f -name "*.html" -exec rm -f {} \;

# Use the find command to locate HTML files and copy them to the destination directory
find "$source_dir" -type f -name "*.html" -exec cp {} "$destination_dir" \;
cp appsscript.json ./build

echo $(date)
echo "HTML files copied to $destination_dir"
