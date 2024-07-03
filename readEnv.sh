#!/bin/bash

# Base command you want to run
COMMAND="node .output/server/index.mjs"

# Construct the prefix part with all environment variables
PREFIX=""
while IFS='=' read -r name value ; do
  if [[ "$name" != "_" ]]; then  # Exclude the special variable _
    PREFIX="$PREFIX$name='$value' "
  fi
done < <(env)

# Combine the prefix and the command
FINAL_COMMAND="$PREFIX$COMMAND"

# Execute the final command
eval $FINAL_COMMAND