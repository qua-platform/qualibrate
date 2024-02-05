import createFlagContext from "../../../../utils/contexts/AbstractFlagContextBuilder";

const [useShowFilterContext, ShowFilterContextProvider] = createFlagContext();
// const [useShowFilterContext, ShowFilterContextProvider] = createFlagContext();

export { useShowFilterContext, ShowFilterContextProvider };
