import React, { useState, useEffect } from "react";
import styled from "styled-components";
import dataset from "./dataset";
import Column from "./Column";
import { DragDropContext, Droppable } from "react-beautiful-dnd";

const Container = styled.div`
  display: flex;
`;

const App = () => {
  const [data, setData] = useState(dataset);
  const [addData, setAddData] = useState();
  const [currGrp, setCurrGrp] = useState(4);
  const [currHigh, setCurrHigh] = useState(4);

  useEffect(() => {
    let data = window.localStorage.getItem("data");
    data = JSON.parse(data);
    setData(data);
  }, []);

  useEffect(() => {
      window.localStorage.setItem("data", JSON.stringify(data));
  });

  const addHighlight = () => {
    const highlight = prompt("Enter highlight: ");
    if (highlight !== null) {
      data.tasks[`task-${currHigh + 1}`] = {
        id: `task-${currHigh + 1}`,
        content: highlight,
      };
      data.columns[`column-${currGrp}`].taskIds.push(`task-${currHigh + 1}`);
      setCurrHigh(currHigh + 1);
      setData(data);
      window.localStorage.setItem("data", data);
    }
  };

  const addGroup = () => {
    const group = prompt("Enter group name");
    if (group !== null) {
      data.columns[`column-${currGrp + 1}`] = {
        id: `column-${currGrp + 1}`,
        title: group,
        taskIds: [],
      };
      data.columnOrder.push(`column-${currGrp + 1}`);
      console.log(data);
      setCurrGrp(currGrp + 1);
      setData(data);
      window.localStorage.setItem("data", data);
    }
  };

  const onDragEnd = (result) => {
    const { destination, source, draggableId, type } = result;
    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    if (type === "column") {
      const newColumnOrder = Array.from(data.columnOrder);
      newColumnOrder.splice(source.index, 1);
      newColumnOrder.splice(destination.index, 0, draggableId);
      const newState = {
        ...data,
        columnOrder: newColumnOrder,
      };
      setData(newState);
      window.localStorage.setItem("data", newState);
      return;
    }

    const start = data.columns[source.droppableId];
    const finish = data.columns[destination.droppableId];

    if (start === finish) {
      const newTaskIds = Array.from(start.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);
      const newColumn = {
        ...start,
        taskIds: newTaskIds,
      };
      const newState = {
        ...data,
        columns: {
          ...data.columns,
          [newColumn.id]: newColumn,
        },
      };
      setData(newState);
      return;
    }

    const startTaskIds = Array.from(start.taskIds);
    startTaskIds.splice(source.index, 1);
    const newStart = {
      ...start,
      taskIds: startTaskIds,
    };

    const finishTaskIds = Array.from(finish.taskIds);
    finishTaskIds.splice(destination.index, 0, draggableId);
    const newFinish = {
      ...finish,
      taskIds: finishTaskIds,
    };

    const newState = {
      ...data,
      columns: {
        ...data.columns,
        [newStart.id]: newStart,
        [newFinish.id]: newFinish,
      },
    };

    setData(newState);
  };

  return (
    <div>
      <div>
        <button
          style={{
            fontSize: "15px",
            borderRadius: "5px",
            margin: "5px",
          }}
          onClick={addGroup}
        >
          Add Group
        </button>
        <button
          style={{
            fontSize: "15px",
            borderRadius: "5px",
            margin: "5px",
          }}
          onClick={addHighlight}
        >
          Add Highlight
        </button>
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable
          droppableId="all-columns"
          direction="horizontal"
          type="column"
        >
          {(provided) => (
            <Container {...provided.droppableProps} ref={provided.innerRef}>
              {data.columnOrder.map((id, index) => {
                const column = data.columns[id];
                const tasks = column.taskIds.map(
                  (taskId) => data.tasks[taskId]
                );

                return (
                  <Column
                    key={column.id}
                    column={column}
                    tasks={tasks}
                    index={index}
                  />
                );
              })}
              {provided.placeholder}
            </Container>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default App;
