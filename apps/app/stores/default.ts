import { useState, useEffect, useCallback } from 'react';
import { getItem, setItem } from "../utils/tools/local.storage";
import request from '../utils/request';

const useDefault = () => {
  
  const [defaultValue, setDefaultValue] = useState({});

  // const initializeSign = useCallback(async () => {
  // }, [])

  // useEffect(() => {
  // })
  
  return {
    defaultValue, setDefaultValue,
  };



};

export default useDefault;