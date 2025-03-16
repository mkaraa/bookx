import { useState } from "react";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, X } from "lucide-react";

interface SearchFilterProps {
  categories: string[];
  conditions: string[];
  listingTypes: string[];
  selectedCategory: string;
  selectedCondition: string;
  selectedListingType: string;
  searchTerm: string;
  onCategoryChange: (category: string) => void;
  onConditionChange: (condition: string) => void;
  onListingTypeChange: (listingType: string) => void;
  onSearchChange: (searchTerm: string) => void;
  onApplyFilters: () => void;
  onResetFilters: () => void;
}

export default function SearchFilter({
  categories,
  conditions,
  listingTypes,
  selectedCategory,
  selectedCondition,
  selectedListingType,
  searchTerm,
  onCategoryChange,
  onConditionChange,
  onListingTypeChange,
  onSearchChange,
  onApplyFilters,
  onResetFilters,
}: SearchFilterProps) {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange(localSearchTerm);
    onApplyFilters();
  };

  const toggleMobileFilters = () => {
    setShowMobileFilters(!showMobileFilters);
  };

  const anyFilterApplied = selectedCategory || selectedCondition || selectedListingType || searchTerm;

  // Desktop filters view
  const FiltersContent = () => (
    <>
      <div className="mb-6">
        <div className="relative">
          <form onSubmit={handleSearchSubmit}>
            <Input
              type="text"
              placeholder="Search books..."
              value={localSearchTerm}
              onChange={(e) => setLocalSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2"
            />
            <div className="absolute left-3 top-2.5 text-slate-400">
              <Search className="h-5 w-5" />
            </div>
          </form>
        </div>
      </div>

      <Accordion type="multiple" defaultValue={["category", "condition", "type"]}>
        <AccordionItem value="category">
          <AccordionTrigger>Category</AccordionTrigger>
          <AccordionContent>
            <RadioGroup value={selectedCategory} onValueChange={onCategoryChange}>
              <div className="space-y-2">
                {categories.map((category) => (
                  <div key={category} className="flex items-center space-x-2">
                    <RadioGroupItem value={category} id={`category-${category}`} />
                    <Label htmlFor={`category-${category}`} className="cursor-pointer">
                      {category}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="condition">
          <AccordionTrigger>Condition</AccordionTrigger>
          <AccordionContent>
            <RadioGroup value={selectedCondition} onValueChange={onConditionChange}>
              <div className="space-y-2">
                {conditions.map((condition) => (
                  <div key={condition} className="flex items-center space-x-2">
                    <RadioGroupItem value={condition} id={`condition-${condition}`} />
                    <Label htmlFor={`condition-${condition}`} className="cursor-pointer">
                      {condition}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="type">
          <AccordionTrigger>Listing Type</AccordionTrigger>
          <AccordionContent>
            <RadioGroup value={selectedListingType} onValueChange={onListingTypeChange}>
              <div className="space-y-2">
                {listingTypes.map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <RadioGroupItem value={type} id={`type-${type}`} />
                    <Label htmlFor={`type-${type}`} className="cursor-pointer">
                      {type === 'sell' ? 'For Sale' : 'Wanted'}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="mt-6 space-y-3">
        <Button 
          className="w-full" 
          onClick={onApplyFilters}
        >
          Apply Filters
        </Button>
        
        {anyFilterApplied && (
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={onResetFilters}
          >
            Reset Filters
          </Button>
        )}
      </div>
    </>
  );

  // Mobile view button to show filters
  const MobileFilterToggle = () => (
    <div className="md:hidden mb-4">
      <Button 
        variant="outline" 
        className="w-full flex items-center justify-center gap-2"
        onClick={toggleMobileFilters}
      >
        <Filter className="h-4 w-4" />
        {showMobileFilters ? "Hide Filters" : "Show Filters"}
        {anyFilterApplied && (
          <span className="bg-primary text-white text-xs rounded-full px-2 py-0.5 ml-1">
            {(selectedCategory ? 1 : 0) + (selectedCondition ? 1 : 0) + (selectedListingType ? 1 : 0) + (searchTerm ? 1 : 0)}
          </span>
        )}
      </Button>
    </div>
  );

  // Mobile view slide-over for filters
  const MobileFiltersView = () => (
    showMobileFilters && (
      <div className="fixed inset-0 z-50 bg-black/50 md:hidden">
        <div className="fixed inset-y-0 right-0 w-full max-w-xs bg-white p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Filters</h2>
            <Button variant="ghost" size="icon" onClick={toggleMobileFilters}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          <FiltersContent />
        </div>
      </div>
    )
  );

  return (
    <>
      <MobileFilterToggle />
      <MobileFiltersView />

      <Card className="hidden md:block">
        <CardContent className="pt-6">
          <h2 className="text-lg font-semibold mb-4">Filters</h2>
          <FiltersContent />
        </CardContent>
      </Card>
    </>
  );
}
