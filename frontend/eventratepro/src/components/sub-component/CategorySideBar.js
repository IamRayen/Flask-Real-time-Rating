import { useState } from "react";


function CategorySideBar({list,current,signal,onAdd}){

  const handleCategoryClick = (id) => {
    signal(id);
  };
    const renderCategories=()=>
       list.map((item)=>{
          return(  
              <div
                key={item.criteriaID}
                className={`category ${
                  current === item.criteriaID? "active" : ""
                }`}
                onClick={() => handleCategoryClick(item.criteriaID)}
              >
                 {item.title}
              </div>);
              
            });

        const handleAddClick = () => {
            const name = prompt("Enter category name:");
            if (name) {
                onAdd(name); 
            }
         };
    


    return (
    <div className="categories">
        {renderCategories()}
        <div className="add-category" onClick={handleAddClick}> + </div>
    </div>


    )
}

export default CategorySideBar;