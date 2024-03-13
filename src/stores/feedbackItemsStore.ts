import { create } from "zustand";
import { TFeedbackItem } from "../lib/types";

type Store = {
  feedbackItems: TFeedbackItem[];
  isLoading: boolean;
  errorMessage: string;
  selectedCompany: string;
  getCompanyList: () => string[];
  getFilteredFeedbackItems: () => TFeedbackItem[];
  addItemToList: (text: string) => Promise<void>;
  selectCompany: (company: string) => void;
  fetchFeedbackItems: () => Promise<void>;
};

export const useFeedbackItemsStore = create<Store>((set, get) => ({
  feedbackItems: [],
  isLoading: false,
  errorMessage: "",
  selectedCompany: "",
  getCompanyList: () => {
    return get()
      .feedbackItems.map((item) => item.company)
      .filter((company, index, array) => {
        return array.indexOf(company) === index;
      });
  },
  getFilteredFeedbackItems: () => {
    const state = get();

    return state.selectedCompany
      ? state.feedbackItems.filter(
          (feedbackItem) => feedbackItem.company === state.selectedCompany
        )
      : state.feedbackItems;
  },
  addItemToList: async (text: string) => {
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

    //setFeedbackItems([...feedbackItems, newItem]);
    set((state) => ({
      feedbackItems: [...state.feedbackItems, newItem],
    }));

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
  },
  selectCompany: (company: string) => {
    set(() => ({
      selectedCompany: company,
    }));
  },
  fetchFeedbackItems: async () => {
    //setIsLoading(true);
    set(() => ({
      isLoading: true,
    }));

    try {
      const response = await fetch(
        "https:///bytegrad.com/course-assets/projects/corpcomment/api/feedbacks"
      );
      if (!response.ok) {
        throw new Error();
      }
      const data = await response.json();
      //setFeedbackItems(data.feedbacks);
      set(() => ({
        feedbackItems: data.feedbacks,
      }));
    } catch (error) {
      //setErrorMessage("Something wet wrong.");
      set(() => ({
        errorMessage: "Something wet wrong.",
      }));
    }

    //setIsLoading(false);
    set(() => ({
      isLoading: false,
    }));
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
  },
}));
