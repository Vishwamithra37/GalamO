# A simple program to find all words which start with text- and have a space after the word is complete. THis needs to go through the specified list of files.
import os
import glob

the_files = [
    "./static/js/*.js",
    "./templates/*.html",
    "./temaplates/mail_templates/*.html",
]
for directory in the_files:
    for filename in glob.glob(directory):
        print(filename)
        try:
            with open(filename) as f:
                for line in f:
                    if "text-" in line:
                        print(line.split("text-")[1].split(" ")[0])

        except:
            print("Error in file: ", filename)
            continue
