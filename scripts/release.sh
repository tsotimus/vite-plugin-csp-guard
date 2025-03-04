#!/bin/bash

# Dry-run flag (set to true for testing)
DRY_RUN=false
PACKAGE_NAME="vite-plugin-csp-guard"

select_version() {
  echo "Select version type:"
  options=("major" "minor" "patch" "beta" "alpha" "Quit")
  PS3="Enter the number of your choice: "
  select version in "${options[@]}"; do
    case $version in
      "major"|"minor"|"patch"|"beta"|"alpha")
        echo "Selected version: $version"
        SEMVER=$version
        break
        ;;
      "Quit")
        echo "Exiting."
        exit 0
        ;;
      *)
        echo "Invalid option. Please try again."
        ;;
    esac
  done
}

check_branch() {
  if [[ "$DRY_RUN" == false ]]; then
    CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
    if [[ "$CURRENT_BRANCH" != "main" ]]; then
      echo "Error: not on 'main' branch."
      exit 1
    fi

    if ! git diff-index --quiet HEAD --; then
      echo "Error: There are uncommitted changes."
      exit 1
    fi

    if [ "$(git log origin/$CURRENT_BRANCH..HEAD)" != "" ]; then
      echo "Error: There are unpushed commits."
      exit 1
    fi
  else
    echo "Dry-run mode: Skipping Git checks."
  fi
}

update_version() {
  if ! [ -x "$(command -v pnpm)" ]; then
    echo 'Error: PNPM is not installed.' >&2
    exit 1
  fi

  cd "./packages/$PACKAGE_NAME" || exit
  if [[ "$SEMVER" == "beta" || "$SEMVER" == "alpha" ]]; then
    pnpm version prerelease --preid="$SEMVER"
  else
    pnpm version $SEMVER
  fi
  cd - || exit
}

get_new_version() {
  PACKAGE_JSON="./packages/$PACKAGE_NAME/package.json"
  if ! [ -f "$PACKAGE_JSON" ]; then
    echo "Error: $PACKAGE_JSON doesn't exist."
    exit 1
  fi
  node -pe "require('$PACKAGE_JSON').version"
}

create_release_branch() {
  VERSION=$(get_new_version)
  BRANCH_NAME="release/${PACKAGE_NAME}_${VERSION}"
  
  git checkout -b "$BRANCH_NAME"
  git add "./packages/$PACKAGE_NAME/package.json"
  git commit -m "chore(release): bump $PACKAGE_NAME to v$VERSION"
  git push origin "$BRANCH_NAME"
  echo "Created new release branch: $BRANCH_NAME"
}

publish_package() {
  if [[ "$DRY_RUN" == false ]]; then
    if [[ "$SEMVER" == "beta" || "$SEMVER" == "alpha" ]]; then
      cd "./packages/$PACKAGE_NAME" || exit
      pnpm publish --access public
      cd - || exit
      echo "Package published."
    else
      create_release_branch
    fi
  else
    echo "Dry-run mode: Skipping package publish and branch creation."
  fi
}

run_deploy() {
  check_branch
  update_version
  publish_package
}

# Main execution
select_version
run_deploy