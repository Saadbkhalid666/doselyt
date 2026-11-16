# MedStock (frontend only)

    npm install
    npm run dev

UI only: all data comes from `src/data/mockData.js`, components take data and callbacks via props.
Search/filter controls, add/edit forms and "Mark as Taken" are visual; wire them to your own logic.
`src/hooks/useSimulatedLoad.js` only fakes a loading state for the skeletons; replace it with your real flag.
