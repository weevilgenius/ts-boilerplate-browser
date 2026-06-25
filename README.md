## ts-boilerplate-browser

My boilerplate template for starting new projects targeting modern browsers.
It uses pnpm, Typescript, Vite, and ESlint with opinionated rules.

There are two branches depending on the style of project.
* `main` - Basic browser project with no frameworks
* `mithril` - Browser project with Mithril framework and Webawesome components

To use it, either select it as a template when starting a new project in GitHub
or do this:

```
# Replace <branch> with 'main' or 'mithril'
git clone --single-branch -b <branch> https://github.com/weevilgenius/ts-boilerplate-browser.git my-new-project
cd my-new-project
rm -rf .git
git init
git branch -M main
pnpm install
# edit files as needed
git add .
git commit -m "initial commit"
```
