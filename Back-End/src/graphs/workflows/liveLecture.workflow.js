import { StateGraph } from "@langchain/langgraph";
import { LectureState } from "../../agents/states/lecture.state.js";

import { deepgramNode } from "../nodes/deepgram.node.js";
import { highlightNode } from "../nodes/highlight.node.js";
import { materialDecisionNode } from "../nodes/decision.node.js";
import { embedNode } from "../nodes/embed.node.js";

export const liveLectureWorkflow = new StateGraph(LectureState)
    .addNode("deepgram", deepgramNode)
    .addNode("highlight", highlightNode)
    .addNode("embed", embedNode)

    .addConditionalEdges("deepgram", materialDecisionNode, {
        HAS_MATERIAL: "embed",
        NO_MATERIAL: "highlight"
    })

    .setEntryPoint("deepgram")
    .compile();
