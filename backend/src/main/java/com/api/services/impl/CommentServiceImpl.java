package com.api.services.impl;

import com.api.models.Comment;
import com.api.models.Event;
import com.api.models.User;
import com.api.repositories.CommentRepository;
import com.api.repositories.EventRepository;
import com.api.repositories.UserRepository;
import com.api.services.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CommentServiceImpl implements CommentService {
    
    private final CommentRepository commentRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    
    @Autowired
    public CommentServiceImpl(
            CommentRepository commentRepository,
            EventRepository eventRepository,
            UserRepository userRepository) {
        this.commentRepository = commentRepository;
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
    }
    
    @Override
    public List<Comment> getAllComments() {
        return commentRepository.findAll();
    }
    
    @Override
    public List<Comment> getCommentsByEvent(Integer eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found with id: " + eventId));
        
        return commentRepository.findByEvent(event);
    }
    
    @Override
    public List<Comment> getCommentsByUser(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));
        
        return commentRepository.findByUser(user);
    }
    
    @Override
    public Comment addComment(Comment comment) {
        // Validate rating
        if (comment.getRating() < 1 || comment.getRating() > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5");
        }
        
        return commentRepository.save(comment);
    }
    
    @Override
    public void deleteComment(Integer eventId, Integer userId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found with id: " + eventId));
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));
        
        commentRepository.deleteByEventAndUser(event, user);
    }
} 