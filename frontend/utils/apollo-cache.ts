import { AsyncStorageWrapper, CachePersistor } from "apollo3-cache-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";

const cache = new InMemoryCache();

const persistor = new CachePersistor({
  cache,
  storage: new AsyncStorageWrapper(AsyncStorage),
  maxSize: 5 * 1024 * 1024, // 5 MB
});

// ใน _layout.tsx
useEffect(() => {
  persistor.restore();
}, []);
