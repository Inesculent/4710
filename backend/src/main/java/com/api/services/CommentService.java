package com.api.services;

import com.api.models.Comment;
import com.api.models.Event;
import com.api.models.User;

import java.util.List;

public interface CommentService {
    List<Comment> getAllComments();
    List<Comment> getCommentsByEvent(Integer eventId);
    List<Comment> getCommentsByUser(Integer userId);
    Comment addComment(Comment comment);
    void deleteComment(Integer eventId, Integer userId);
} 