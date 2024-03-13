import { useEffect, useMemo, useState } from "react";
import { TFeedbackItem } from "../lib/types";
import { createContext } from "react";

type TFeedbackItemsContext = {
  filteredFeedbackItems: TFeedbackItem[];
  isLoading: boolean;
  errorMessage: string;
  companyList: string[];
  selectedCompany: string;
  handleSelectCompany: (company: string) => void;
  handleAddToList: (text: string) => void;
};

export const FeedbackItemsContext = createContext<TFeedbackItemsContext | null>(
  null
);

export default function FeedbackItemsContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [feedbackItems, setFeedbackItems] = useState<TFeedbackItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<string>("");

  const filteredFeedbackItems = useMemo(
    () =>
      selectedCompany
        ? feedbackItems.filter(
            (feedbackItem) => feedbackItem.company === selectedCompany
          )
        : feedbackItems,
    [feedbackItems, selectedCompany]
  );

  const companyList = useMemo(
    () =>
      feedbackItems
        .map((item) => item.company)
        .filter((company, index, array) => {
          return array.indexOf(company) === index;
        }),
    [feedbackItems]
  );

  const handleSelectCompany = (company: string) => {
    setSelectedCompany(company);
  };

  const handleAddToList = async (text: string) => {
    const companyName = text
      .split(" ")
      .find((word) => word.startsWith("#"))!
      .substring(1);

    const newItem: TFeedbackItem = {
      id: new Date().getTime(),
      text: text,
      upvoteCount: 0,
      daysAgo: 0,
      company: companyName,
      badgeLetter: companyName.substring(0, 1).toUpperCase(),
    };

    setFeedbackItems([...feedbackItems, newItem]);

    await fetch(
      "https:///bytegrad.com/course-assets/projects/corpcomment/api/feedbacks"
    ),
      {
        method: "POST",
        body: JSON.stringify(newItem),
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      };
  };

  useEffect(() => {
    const fetchFeedbackItems = async () => {
      setIsLoading(true);

      try {
        const response = await fetch(
          "https:///bytegrad.com/course-assets/projects/corpcomment/api/feedbacks"
        );
        if (!response.ok) {
          throw new Error();
        }
        const data = await response.json();
        setFeedbackItems(data.feedbacks);
      } catch (error) {
        setErrorMessage("Something wet wrong.");
      }

      setIsLoading(false);
    };

    fetchFeedbackItems();
    /*
    setIsLoading(true)
    fetch('https:///bytegrad.com/course-assets/projects/corpcomment/api/feedbacks')
      .then((response) => {
        if(!response.ok){
          throw new Error()
        }
        return response.json()
      })
      .then((data) -> {
        setFeedbackItems(data.feedbacks)
        setIsLoading(false)
      })
      .catch(() => {
        setErrorMessage("Something wet wrong.")
        setIsLoading(false)
      })
    */
  }, []);

  return (
    <FeedbackItemsContext.Provider
      value={{
        filteredFeedbackItems,
        isLoading,
        errorMessage,
        companyList,
        selectedCompany,
        handleSelectCompany,
        handleAddToList,
      }}
    >
      {children}
    </FeedbackItemsContext.Provider>
  );
}
